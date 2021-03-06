const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');
const stripe = require('../stripe');

const mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('you must be logged in to do that!');
    }
    const item = await ctx.db.mutation.createItem({
      data: {
        // this is how we create a relationship between the item and the user
        user: {
          connect: {
            id: ctx.request.userId,
          },
        },
        ...args,
      },
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
    const item = await ctx.db.query.item({ where }, '{id title user{id}}');
    // 2. check if they own that item or if they have the permission
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some((permission) => ['ADMIN', 'ITEMDELETE'].includes(permission));
    console.log('ownsitem', ownsItem);
    console.log('hasPermissions', hasPermissions);
    if (!ownsItem && hasPermissions) {
      throw new Error('you arent allowed to delete this item');
    }
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
    // console.log('res', res);
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
  async updatePermissions(parent, args, ctx, info) {
    // 1. check if logged in
    if (!ctx.request.userId) {
      throw new Error('you must be logged in!');
    }
    // 2. query current user
    const currentUser = await ctx.db.query.user({ where: { id: ctx.request.userId } }, info);
    // 3. check if they have permissions to do this
    console.log('currentUser', currentUser);
    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
    // 4.update the permissions
    return ctx.db.mutation.updateUser({
      data: {
        permissions: {
          set: args.permissions,
        },
      },
      where: {
        id: args.userId,
      },
    }, info);
  },
  async addToCart(parent, args, ctx, info) {
    const { userId } = ctx.request;
    // check signed in
    if (!userId) {
      throw new Error('you must be logged in!');
    }
    // 1. query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id },
      },
    });
    console.log('existingCartItem', existingCartItem);
    // 2. check if that item is already in the cart, increment if so
    if (existingCartItem) {
      console.log('this item is already in the cart');
      return ctx.db.mutation.updateCartItem({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + 1 },
      }, info);
    }
    // 3. create cartitem for that user if not already in the cart
    return ctx.db.mutation.createCartItem({
      data: {
        user: {
          connect: { id: userId },
        },
        item: {
          connect: { id: args.id },
        },
      },
    }, info);
  },
  async removeFromCart(parent, args, ctx, info) {
    // 1. find the cart item
    const cartItem = await ctx.db.query.cartItem({
      where: {
        id: args.id,
      },
    }, '{id, user {id}}');
    console.log('cartItem', cartItem);
    if (!cartItem) {
      throw new Error('No cart item found');
    }
    // 2. make sure they own that cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error('caught you cheating!');
    }
    // 3.delete that cart item
    return ctx.db.mutation.deleteCartItem({
      where: { id: args.id },
    }, info);
  },
  async createOrder(parent, args, ctx, info) {
    // 1. Query the current user to see if signed in
    const { userId } = ctx.request;
    if (!userId) throw new Error('you must be signed in to make order');
    const user = await ctx.db.query.user({ where: { id: userId } }, `{
      id
      name
      email
      cart {
          id
          quantity
          item { title price  id description image largeImage }
      }}`);
    // 2. recalc the total for the amount
    const amount = user.cart.reduce(
      (tally, cartItem) => tally + cartItem.item.price * cartItem.quantity, 0,
    );
    console.log(`Going to charge for a total of ${amount}`);
    // 3.create the stripe charge (turn token into $$$!!)
    const charge = await stripe.charges.create({
      amount,
      currency: 'USD',
      source: args.token,
    });
    // 4.convert the cart items and order items
    const orderItems = user.cart.map((cartItem) => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } },
      };
      delete orderItem.id;
      return orderItem;
    });
    // 5. create the order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } },
      },
    });
    // 6. clean up - clear the users cart, delete cartItems
    const cartItemIds = user.cart.map((cartItem) => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds,
      },
    });
    // 7. return the order to the client
    return order;
  },
};

module.exports = mutations;
