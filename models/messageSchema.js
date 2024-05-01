import mongoose, { mongo } from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema({
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
	message: {
		type: String,
		required: true,
		minLength: [10, "Message must contain atleast 10 characters!"],
	},
});

export const Message =  mongoose.model("Message",messageSchema)