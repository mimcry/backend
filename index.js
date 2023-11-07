import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bodyparser from "body-parser";
import nodemailer from "nodemailer";
const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://127.0.0.1/myLoginRegisterDB")
  .then(() => {
    console.log("sucess");
  })
  .catch((err) => {
    console.log("no connection");
  });

const userSchema = new mongoose.Schema({
  firstname: String,
  email: String,
  password: String,
});
const User = new mongoose.model("User", userSchema);

//routes
app.post("/login", (req, res) => {
  const { email, password,username } = req.body;

  // Find the user with the provided email
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        if (password === user.password) {
          if(username!=""){
            user = { ...user._doc, username };

          res.send({ message: "Login successfully", user });
        }else{
          res.send({ message: "set user name" });

      } }
          else {
          res.send({ message: "Password didn't match" });
        }
      } else {
        res.send({ message: "User not registered" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "An error occurred during login" });
    });
});

app.post("/register", async (req, res) => {
  const { firstname, lastname, email, password, address } = req.body;

  try {
    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      // User already registered
      res.send({ message: "User already registered" });
      return;
    }

    // If the user doesn't exist, create a new user
    const newUser = new User({
      firstname,
      lastname,
      email,
      password,
      address,
    });

    // Save the new user to the database
    await newUser.save();

    // User successfully registered
    res
      .status(200)
      .json({ message: "Successfully registered. Please log in now." });
  } catch (err) {
    // Handle any errors that occur during the process
    console.error(err);
    res.status(500).json({ message: "An error occurred during registration." });
  }
});
app.get("/contactus", async (req, res) => {
  res.sendFile(__dirname);
});

app.post("/contactus", async (req, res) => {
  const mai = req.body.mail;
  const na = req.body.name;
  const mes = req.body.message;
  var transporter = nodemailer.createTransport({
    service: "gmail",

    auth: { user: "salongautam4@gmail.com", pass: "pbhe nqcp otob xrio" },
  });
  var mailOptions = {
    from: "salongautam4@gmail.com",
    to: req.body.name,
    cc: "salongautam4@gmail.com",
    subject: "Thanks for giving feedback" + "" + na,
    text: mes + mai,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      res.send("mail send");
      console.log("email sent" + info.response);
    }
  });
  res.send({ message: mes });
});
app.post("/checkout", async (req, res) => {
  const { mail, name, cartItems, number, address } = req.body;
  const tableRows = cartItems.map((item) => {
    return `<tr>
      <td>${item.img}</td>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>Rs ${item.price}</td>
    </tr>`;
  });

  const emailContent = `
    <h1>Order Details for "${name}" should be delivered to " ${address}" and contact information : ${number}</h1>
    <table>
      <tr>
        <th>Image</th>
        <th>Description</th>
        <th>Quantity</th>
        <th>Price</th>

      </tr>
      ${tableRows.join("")}
    </table>
  `;

  // Configure your nodemailer and send the order confirmation email here
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "salongautam4@gmail.com",
      pass: "pbhe nqcp otob xrio",
    },
  });

  var mailOptions = {
    from: mail,
    to: "salongautam4@gmail.com", // Use the 'mail' field from the request

    subject: `${name} - Order Confirmation`,
    html: emailContent,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "An error occurred while sending the email" });
    } else {
      console.log("Email sent: " + info.response);
      res.json({ message: "Order received successfully" });
    }
  });

  // You can also save the order data to the database if needed
  // Example: Save the order to the database using Mongoose
  // const order = new Order({ mail, name, cartItems, number, address });
  // order.save()
});
app.post("/bookroom", async (req, res) => {
  const {
    mail,
    name,
    specialnote,
    img,room,
    description,
    price,
    checkOutDate,
    checkInDate,
    
    number,
   
  } = req.body;
  const tableRows = () => {
    return [
      `<tr>
      <td>${img}</td>
      <td>${description}</td>  
      
      <td> ${checkInDate}</td>
      <td> ${checkOutDate}</td>
      <td>${room}</td>
      <td>Rs ${price}</td>
    </tr>`,
    ];
  };

  const emailContent = `
    <h1>Booked by ${name} with contact information ${number}</h1>
    <h3>Message from Visiter: ${specialnote}</h3>
    <table>
      <tr>
        <th>Image</th>
        <th>Description</th>        
       
        <th>CheckInDate</th>
        <th>CheckOutDate</th>
        <th>Total Room</th>
        <th>Price</th>

      </tr>
      ${tableRows().join("")}
    </table>
  `;
  var transporter = nodemailer.createTransport({
    service: "gmail",

    auth: { user: "salongautam4@gmail.com", pass: "pbhe nqcp otob xrio" },
  });
  var mailOptions = {
    from: mail,
    to: "salongautam4@gmail.com",
    cc: "salongautam4@gmail.com",
    subject: `${name} - Booked the room`,
    html: emailContent,
  
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      res.send("mail send");
      console.log("email sent" + info.response);
    }
  });
});
app.listen(9002, () => {
  console.log("BE started at port 9002");
});
