const db = require('../../db/db');
const screenshotManager = require('./screenshotManager');

module.exports = {
  getScreenshots,
  getModerators,
  getLastModerated,
  moderateScreenshot,
};

async function getScreenshots({ approvalStatus = null, userId = null }) {
  const where = {};
  if (approvalStatus !== null) {
    where.approvalStatus = approvalStatus;
  }
  if (userId !== null) {
    where.moderatedBy = userId;
  }
  return db.Screenshot.findAll({
    attributes: [
      'id',
      'gameCanonicalName',
      'year',
      'createdAt',
      'approvalStatus',
      'ScreenshotImageId',
    ],
    where,
    limit: 500,
    order: [['createdAt', 'DESC']],
    include: [
      { model: db.ScreenshotName, attributes: ['name'] },
      { model: db.ScreenshotImage, attributes: ['path'] },
    ],
  }).map(screenshot => ({
    id: screenshot.id,
    gameCanonicalName: screenshot.gameCanonicalName,
    alternativeNames: screenshot.ScreenshotNames.map(name => name.name).filter(
      name => name !== screenshot.gameCanonicalName.toLowerCase()
    ),
    year: screenshot.year,
    imageUrl: screenshot.ScreenshotImage.thumbUrl,
    createdAt: screenshot.createdAt,
    approvalStatus: screenshot.approvalStatus,
  }));
}

async function moderateScreenshot({ screenshotId, user, newApprovalStatus }) {
  const [moderator, screenshot] = await Promise.all([
    db.User.findByPk(user.id),
    db.Screenshot.findByPk(screenshotId),
  ]);
  if (!moderator) {
    throw new Error('Moderator not found');
  }
  if (!screenshot) {
    throw new Error('Screenshot not found');
  }
  if (newApprovalStatus === screenshot.approvalStatus) {
    return;
  }

  const shouldIncrement = newApprovalStatus === 1;
  const shouldDecrement =
    (newApprovalStatus === -1 || newApprovalStatus === 0) &&
    screenshot.approvalStatus === 1;

  const uploaderUser = await db.User.findByPk(screenshot.UserId);
  await Promise.all([
    screenshot.update({
      approvalStatus: newApprovalStatus,
      moderatedBy: moderator.id,
      moderatedAt: new Date(),
    }),
    shouldIncrement && uploaderUser.increment('addedScreenshots'),
    shouldDecrement && uploaderUser.decrement('addedScreenshots'),
    newApprovalStatus === -1 &&
      screenshotManager.removeSolvedPointsForScreenshot({ screenshotId }),
  ]);
}

async function getModerators() {
  return db.User.findAll({
    where: {
      canModerateScreenshots: 1,
    },
  });
}

async function getLastModerated() {
  return db.Screenshot.findOne({
    where: { approvalStatus: 1 },
    order: [['moderatedAt', 'DESC']],
  });
}
