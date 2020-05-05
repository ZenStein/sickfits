const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');

const mutations = {
  async createItem(parent, args, ctx, info) {
    const item = await ctx.db.mutation.createItem({
      data: { ...args },
    }, info);
    return item;
  },

  updateItem(parent, args, ctx, info) {
    // first take a copy of the updates
    const updates = { ...args };
    // remove the id from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id,
      },
    }, info);
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. find the item
    const item = await ctx.db.query.item({ where }, '{id title}');
    // 2. check if they own that item or if they have the permission
    // TODO
    // 3. delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    // hash their password
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ['USER'] },
      },
    }, info);
    // create the JWT token for the user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    // finally we return the user to the browser
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`no such user for email ${email}`);
    }
    // check if password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('invalid password');
    }
    // generate the jwt token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // set the cookie with the token
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    // return the user
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'goodbye!' };
  },
  async requestReset(parent, args, ctx, info) {
    // 1.check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`no such user for email ${args.email}`);
    }
    // 2. set a reset token and expiry on that user
    const promisifiedRandomBytes = promisify(randomBytes);
    const resetToken = (await promisifiedRandomBytes(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // one hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    console.log('res', res);
    // 3. email them the reset token
    const mailRes = await transport.sendMail({
      from: 'shaneenterprises@gmail.com',
      to: user.email,
      subject: 'Your Password reset Token',
      html: makeANiceEmail(`/n/n <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here</a>`),
    });
    return { message: 'thanks!' };
  },
  async resetPassword(parent, args, ctx, info) {
    // 1 check if the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error('passwords dont match');
    }
    // 2 check if legit resettoken
    // make sure not expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    });
    if (!user) {
      throw new Error('token either wrong or expired');
    }
    // hash new password
    const password = await bcrypt.hash(args.password, 10);
    // save new password to user and remove old resetToken
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    // genereate jwt
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // set cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    // return new user
    return updatedUser;
  },
};

module.exports = mutations;
