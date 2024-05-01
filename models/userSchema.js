import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		requireed: true,
		minLength: [3, "First Name must contain at least 3 characters!"],
	},
	lastName: {
		type: String,
		requireed: true,
		minLength: [3, "First Name must contain at least 3 characters!"],
	},
	email: {
		type: String,
		required: true,
		validate: [validator.isEmail, "Please provide a valid Email!"],
	},
	phone: {
		type: String,
		required: true,
		minLength: [10, "Phone Number must contain exact 10 digits!"],
		maxLength: [10, "Phone Number must contain exact 10 digits!"],
	},
	nic: {
		type: String,
		required: true,
		minLength: [10, "NIC must contain exact 10 digits!"],
		maxLength: [10, "NIC must contain exact 10 digits!"],
	},
	dob: {
		type: Date,
		required: [true, "DOB is required!"],
	},
	gender: {
		type: String,
		required: true,
		enum: ["Male", "Female"],
	},
	password: {
		type: String,
		required: true,
		minLength: [5, "Password should be greater than 5 characters!"],
		select: false,
	},
	role: {
		type: String,
		required: true,
		enum: ["Admin", "Patient", "Doctor"],
	},
	doctorDepartment: {
		type: String,
	},
	docAvatar: {
		public_id: String,
		url: String,
	},
});

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPwd) {
	return await bcrypt.compare(enteredPwd, this.password);
};

userSchema.methods.generateJsonWebToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
		expiresIn: process.env.JWT_EXPIRES,
	});
};

export const User = mongoose.model("User", userSchema);
