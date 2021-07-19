const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const DBUtils = require('../utils/DBUtils')();
const {
  process400,
  process401,
  process404,
  process500,
  processData,
} = require('../utils/ResponseUtils');
const Mentor = require('../models/team-up-portal/mentor');
const Student = require('../models/team-up-portal/participant');
const Project = require('../models/team-up-portal/project');

const TEAMUP_SIGNATURE_STRING = ' ';
const noAuthTokenErr = new Error('Not authorized');
noAuthTokenErr.code = 9090;

const verifyRequest = (reqCookies) => {
  if (!reqCookies) throw noAuthTokenErr;

  const ecellAuthCookie = reqCookies
    .split(';')
    // Note: This `token` starts with a whitespace. Hence the trim method in the filtering.
    .filter((str) => str.trim().startsWith('ECELL_AUTH_TOKEN'))[0];

  if (!ecellAuthCookie) throw noAuthTokenErr;

  const token = ecellAuthCookie.split('=')[1];
  const payload = jwt.verify(token, TEAMUP_SIGNATURE_STRING);

  return payload;
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let mentor = await DBUtils.getEntity(Mentor, { email });

    if (!mentor) {
      process404(res, 'No account was found with the E-Mail.');
      return;
    }

    let projectIDs = mentor.projects;

    let credentialsCorrect = await bcrypt.compare(password, mentor.password);
    if (credentialsCorrect) {
      try {
        let signedToken = jwt.sign(
          { mentorID: mentor._id, email: mentor.email },
          TEAMUP_SIGNATURE_STRING
        );
        res.cookie('ECELL_LOGGED_IN', 'mentor');
        res.cookie('ECELL_AUTH_TOKEN', signedToken, {
          sameSite: true,
          httpOnly: true,
          // Use below with https
          // secure: true,
        });
      } catch (err) {
        console.log(err);
        res.status(500).send(err);
      }
      processData(res, mentor);
    } else {
      process401(res, 'Wrong Password.');
    }
  } catch (error) {
    console.log(error);
    process500(res, 'An error occured', error.message);
  }
};

exports.logout = async (req, res) => {
  try {
    verifyRequest(req.headers.cookie);

    res.clearCookie(`ECELL_LOGGED_IN`);
    res.clearCookie(`ECELL_AUTH_TOKEN`);
    processData(res, 'Logged out');
  } catch (err) {
    console.log(err.message);
    process500(res, err.message);
  }
};

exports.updateMentorProjectData = async (req, res) => {
  try {
    const { mentorID } = verifyRequest(req.headers.cookie);
    if (req.params.updateType === 'select-student') {
      const { projectID, studentID } = req.body;

      await DBUtils.updateEntity(
        Project,
        { _id: projectID },
        {
          $pull: { shortlisted: studentID },
          $addToSet: { selected: studentID },
        }
      );
      await DBUtils.updateEntity(
        Student,
        { _id: studentID },
        {
          $pull: { appliedProjects: projectID },
          $addToSet: { selectedProjects: projectID },
        }
      );

      processData(res, { msg: 'Successfully updated', studentID });
    } else if (req.params.updateType === 'shortlist-student') {
      const { projectID, studentID } = req.body;
      await DBUtils.updateEntity(
        Project,
        { _id: projectID },
        { $addToSet: { shortlisted: studentID } }
      );

      processData(res, { msg: 'Successfully updated', studentID });
    }
  } catch (error) {
    console.log(error);
    process500(res, error.message ? error.message : error);
  }
};

exports.getMentorProjects = async (req, res) => {
  try {
    let { mentorID } = verifyRequest(req.headers.cookie);

    let mentor = await DBUtils.getEntity(Mentor, { _id: mentorID });
    let projectIDs = mentor.projects;

    let projects = await DBUtils.getEntityForIds(Project, projectIDs);
    console.log(`projects`, projects);
    processData(res, projects);
  } catch (error) {
    if (error === "Invalid 'for' query") {
      process400(res, error);
    } else {
      process500(res, error.message ? error.message : error);
    }
  }
};

exports.getMentorAppliedStudents = async (req, res) => {
  try {
    verifyRequest(req.headers.cookie);
    const projectID = req.query.for;

    let project = await DBUtils.getEntity(Project, { _id: projectID });
    let studentIDs = project.applicants;

    let students = await DBUtils.getEntityForIds(Student, studentIDs);
    processData(res, students);
  } catch (error) {
    if (error === "Invalid 'for' query") {
      process400(res, error);
    } else {
      process500(res, error.message ? error.message : error);
    }
  }
};

exports.getMentorSelectedStudents = async (req, res) => {
  try {
    verifyRequest(req.headers.cookie);
    const projectID = req.query.for;

    let project = await DBUtils.getEntity(Project, { _id: projectID });
    let studentIDs = project.selected;

    let students = await DBUtils.getEntityForIds(Student, studentIDs);
    processData(res, students);
  } catch (error) {
    if (error === "Invalid 'for' query") {
      process400(res, error);
    } else {
      process500(res, error.message ? error.message : error);
    }
  }
};

exports.getMentorShortlistedStudents = async (req, res) => {
  try {
    verifyRequest(req.headers.cookie);
    const projectID = req.query.for;

    let project = await DBUtils.getEntity(Project, { _id: projectID });
    let studentIDs = project.shortlisted;

    let students = await DBUtils.getEntityForIds(Student, studentIDs);
    processData(res, students);
  } catch (error) {
    if (error === "Invalid 'for' query") {
      process400(res, error);
    } else {
      process500(res, error.message ? error.message : error);
    }
  }
};

exports.updateMentorData = async (req, res) => {
  try {
    const { mentorID } = verifyRequest(req.headers.cookie);

    try {
      const { passwords } = req.body;

      const mentor = await DBUtils.getEntityForId(Mentor, mentorID);
      let credentialsCorrect = await bcrypt.compare(
        passwords.currentPassword,
        mentor.password
      );

      if (credentialsCorrect) {
        let hashedPassword = await bcrypt.hash(passwords.newPassword, 10);

        await DBUtils.updateEntity(
          Mentor,
          { _id: mentorID },
          { password: hashedPassword }
        );
        processData(res, 'Successfully changed password.');
      } else {
        process400(
          res,
          "The current passsword you entered is wrong. Please ensure you've entered the correct password."
        );
        console.log('Wrong password for update');
      }
    } catch (error) {
      console.log(error);
      process500(res, error.message ? error.message : error);
    }
  } catch (error) {
    console.log(error.message);
    if (error.message === 'Not authorized') {
      process401(res, error);
      return;
    }
    process500(res);
  }
};

exports.updateMentorAvatar = async (req, res) => {
  try {
    const { mentorID } = verifyRequest(req.headers.cookie);

    try {
      const { avatarURL } = req.body;

      if (avatarURL) {
        await DBUtils.updateEntity(Mentor, { _id: mentorID }, { avatarURL });
      }
      processData(res, 'Successfully updated');
    } catch (error) {
      console.log(error);
      process500(res, error.message ? error.message : error);
    }
    return;
  } catch (error) {
    console.log(error.message);
    if (error.message === 'Not authorized') {
      process401(res, error);
      return;
    }
    process500(res);
  }
};

exports.getMentorAvatar = async (req, res) => {
  try {
    verifyRequest(req.headers.cookie);
    let { mentorID } = verifyRequest(req.headers.cookie);

    let mentor = await DBUtils.getEntity(Mentor, { _id: mentorID });

    const avatarURL = mentor.avatarURL;

    processData(res, avatarURL);
  } catch (error) {
    if (error === "Invalid 'for' query") {
      process400(res, error);
    } else {
      process500(res, error.message ? error.message : error);
    }
  }
};
