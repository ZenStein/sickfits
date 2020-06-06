const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      console.log('me called no userId');
      return null;
    }
    return ctx.db.query.user({
      where: { id: ctx.request.userId },
    }, info);
  },
  async users(parent, args, ctx, info) {
    // check if logged in
    if (!ctx.request.userId) {
      throw new Error('you must be logged in');
    }
    // 1. check if the user has the permission to query all the users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    // 2. query all the users
    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    // 1. make sure they are logged in
    if (!ctx.request.userId) {
      throw new Error('you must be logged in');
    }
    // 2. query the current order
    const order = await ctx.db.query.order({
      where: { id: args.id },
    }, info);
    // 3. check permissions
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');
    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error('permissions issue... cant see order');
    }
    // 4. return the order
    return order;
  },
  async orders(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You have to be logged in to see orders');
    }
    return ctx.db.query.orders({
      where: {
        user: { id: userId },
      },
    }, info);
  },
};

module.exports = Query;
