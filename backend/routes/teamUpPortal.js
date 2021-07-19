const express = require("express");
const router = express.Router();
const TeamUpPortalController = require("../controllers/TeamUpPortalController");
const TeamUpPortalMentorController = require("../controllers/TeamUpPortalMentorController");

router.get("/projects", TeamUpPortalController.getProjects);
// router.post("/register-participant", TeamUpPortalController.registerParticipant);
router.post("/login", TeamUpPortalController.login)
router.get("/logout/:userType", TeamUpPortalController.logout)
router.get("/s3-signed-policy/:bucketName", TeamUpPortalController.getS3SignedPolicy);
router.put("/update-student-info/:updateType", TeamUpPortalController.updateStudentData);
router.put("/update-project-info/:updateType", TeamUpPortalController.updateProjectData);

router.get("/mentor/projects", TeamUpPortalMentorController.getMentorProjects);
router.get("/mentor/projects/applied-students", TeamUpPortalMentorController.getMentorAppliedStudents);
router.get("/mentor/projects/selected-students", TeamUpPortalMentorController.getMentorSelectedStudents);
router.get("/mentor/projects/shortlisted-students", TeamUpPortalMentorController.getMentorShortlistedStudents);
router.put("/mentor/update-project-info/:updateType", TeamUpPortalMentorController.updateMentorProjectData);
router.put("/mentor/update-mentor-info/password", TeamUpPortalMentorController.updateMentorData);
router.put("/mentor/update-mentor-info/avatar", TeamUpPortalMentorController.updateMentorAvatar);
router.get("/mentor/avatar", TeamUpPortalMentorController.getMentorAvatar);

router.post("/mentor/login", TeamUpPortalMentorController.login)
router.get("/mentor/logout", TeamUpPortalMentorController.logout)

router.post("/mail/:type", TeamUpPortalController.sendMailToUsers);
router.post("/reset-password/:userType", TeamUpPortalController.resetPasswordFromCode);

// No-frontend routes for adding to database
router.post("/projects", TeamUpPortalController.postProjects);
router.post("/mentors", TeamUpPortalController.postMentors);

module.exports = router;