
const User = require("../model/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if username already exists
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck) {
            return res.json({ msg: "Username already used", status: false });
        }

        // Check if email already exists
        const emailCheck = await User.findOne({ email });
        if (emailCheck) {
            return res.json({ msg: "Email already used", status: false });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const user = await User.create({
            email,
            username,
            password: hashedPassword
        });

        // Remove the password field from the response
        delete user.password;

        // Send a success response
        return res.json({ status: true, user });
    } catch (ex) {
        // Pass the error to the next middleware
        next(ex);
    }
};

module.exports.login = async (req, res, next) => {
    try {
      const { username, password } = req.body;
      // Check if UserName exists
      const user = await User.findOne({ username });
      if (!user)
        return res.json({ msg: "Incorrect Username or Password", status: false });
    //Check id Password exists
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.json({ msg: "Incorrect Username or Password", status: false });
    // Remove the password field from the response
      delete user.password;
       // Send a success response
      return res.json({ status: true, user });
    } catch (ex) {
        // Pass the error to the next middleware
      next(ex);
    }
  };
  module.exports.setAvatar = async (req, res, next) => {
    try {
      const userId = req.params.id;
      console.log('Received request to set avatar for user ID:', userId);
  
      const avatarImage = req.body.image;
      const userData = await User.findByIdAndUpdate(
        userId,
        {
          isAvatarImageSet: true,
          avatarImage,
        },
        { new: true }
      );
  
      if (!userData) {
        console.log('User not found with ID:', userId);
        return res.status(404).json({ error: 'User not found' });
      }
  
      return res.json({
        isSet: userData.isAvatarImageSet,
        image: userData.avatarImage,
      });
    } catch (ex) {
      console.error('Error setting avatar:', ex);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  module.exports.getAllUsers=async(req,res,next)=>{
    try{
      const users=await User.find({_id:{$ne:req.params.id}}).select([
        "email",
        "username",
        "avatarImage",
        "_id",
      ]);
      return res.json(users);
    }catch(ex){
      next(ex);
    }
  };
  const onlineUsers = new Set();
  module.exports.logOut=(req,res,next)=>{
    try{
      if(!req.params.id) return res.json({msg:"User Id is required"});
      onlineUsers.delete(req.params.id);
      return res.status(200).send();
    }catch(ex){
      next(ex);
    }
  };
  