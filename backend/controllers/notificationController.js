const Notification = require("../models/Notification");

// @desc    Get notifications for active company/user
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const companyId = req.user?.company?._id;
    const query = {};

    if (companyId) {
      query.recipientCompany = companyId;
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(25);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   POST /api/notifications/mark-all-read
const markAllAsRead = async (req, res) => {
  try {
    const companyId = req.user?.company?._id;
    const query = companyId ? { recipientCompany: companyId } : {};
    await Notification.updateMany(query, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
