// Import necessary modules
const express = require("express");
const router = express.Router();
const buyerlogin = require("../models/buyer/loginModel");
const cookieAuth = require("../utils/auth");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

router.get("/login", async (req, res) => {
    if (req.cookies.buyer) {
      const id = jwt.verify(req.cookies.buyer,process.env.JWT_SECRET_TOKEN);
      const findId = await buyerlogin.findByPk(id);
      if (findId) {
        res.redirect(`/buyer/${id}/dashboard`);
      } else {
        res.clearCookie("buyer");
        res.render("buyer/login", { wrongPassword: "", emailExist: false });
      }
    } else {
      res.render("buyer/login", { wrongPassword: "", emailExist: true });
    }
  });



  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    const checkData = await buyerlogin.findOne({
      where: {
        email: email,
      },
    });
  
    if (checkData) {
      if (password == checkData.dataValues.password) {
        const token = cookieAuth(checkData.dataValues.id);
        res.cookie("buyer", token, {
          expires: new Date(Date.now() + 172800 * 1000),
          secure: true,
          httpOnly: true,
        });
  
        res.redirect(`/buyer/${checkData.dataValues.id}/dashboard`);
      } else {
        res.render("buyer/login", { wrongPassword: "Wrong password", emailExist: true });
      }
    } else {
      res.render("buyer/login", { wrongPassword: "", emailExist: false });
    }
  });

  router.get("/signup", async (req, res) => {
    if (req.cookies.buyer) {
      const id = jwt.verify(req.cookies.buyer,process.env.JWT_SECRET_TOKEN );
      const findId = await buyerlogin.findByPk(id);
      if (findId) {
        res.redirect(`/buyer/${id}/dashboard`);
      } else {
        res.clearCookie("buyer");
        res.render("buyer/signup", { emailExist: false, wrongPassword: false });
      }
    } else {
      res.render("buyer/signup", { emailExist: false, wrongPassword: false });
    }
  });

  router.post("/signup", async (req, res) => {
    const { name, email, password, confirm,} = req.body;
  
    const result = await buyerlogin.findOne({
      where: {
        email: email,
      },
    });
  
    if (password !== confirm) {
      res.render("buyer/login", { emailExist: false, wrongPassword: true });
    } else {
      if (result) {
        res.render("buyer/signup", { emailExist: true, wrongPassword: false });
      } else {
        const storeData = await buyerlogin
          .create({
            email: email,
            password: password,
            name: name,
          })
          .then((data) => {
            const token = cookieAuth(data.dataValues.id);
            res.cookie("buyer", token, {
              expires: new Date(Date.now() + 172800 * 1000),
              secure: true,
              httpOnly: true,
            });
            console.log(data.dataValues);
            console.log("Store data successfully");
            res.redirect(`/buyer/${data.dataValues.id}/dashboard`);
          })
          .catch((err) => {
            res.json({ err: err.message });
          });
      }
    }
  });
  
  


  module.exports = router;
