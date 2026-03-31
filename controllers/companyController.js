const Company = require("../models/Company");

exports.saveCompany = async (req, res) => {

  const { name, gstNumber, address } = req.body;

  let company = await Company.findOne({ user: req.user._id });

  if (company) {
    company.name = name;
    company.gstNumber = gstNumber;
    company.address = address;
    if (req.file) {
      company.logo = req.file.filename;
    }
    await company.save();
  } else {
    company = await Company.create({
      user: req.user._id,
      name,
      gstNumber,
      address,
      logo: req.file ? req.file.filename : ""
    });
  }

  res.json(company);
};

exports.getCompany = async (req, res) => {
  const company = await Company.findOne({ user: req.user._id });
  res.json(company);
};
