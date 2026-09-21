const complaintService = require("../services/complaintService");
const notificationService = require("../services/notificationService");
const { complaintView } = require("../utils/helpers");
async function create(req, res, next) {
  try {
    res
      .status(201)
      .json({
        complaint: complaintView(
          await complaintService.createComplaint(req.body, req.user),
        ),
      });
  } catch (error) {
    next(error);
  }
}
async function list(req, res, next) {
  try {
    const result = await complaintService.listComplaints(req.query, req.user);
    res.json({
      complaints: result.rows.map(complaintView),
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
}
async function getOne(req, res, next) {
  try {
    res.json({
      complaint: complaintView(
        await complaintService.getComplaint(req.params.id, req.user),
      ),
    });
  } catch (error) {
    next(error);
  }
}
async function updateStatus(req, res, next) {
  try {
    const complaint = await complaintService.updateStatus(
      req.params.id,
      req.body,
      req.user,
    );
    await notificationService.notifyStatusChange(complaint);
    res.json({ complaint: complaintView(complaint) });
  } catch (error) {
    next(error);
  }
}
module.exports = { create, list, getOne, updateStatus };
