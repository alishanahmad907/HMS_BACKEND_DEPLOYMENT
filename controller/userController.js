import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
	const { firstName, lastName, email, phone, dob, nic, gender, role, password } = req.body;

	if (!firstName || !lastName || !email || !phone || !dob || !nic || !gender || !role || !password) {
		return next(new ErrorHandler("Please fill full user form!", 400));
	}

	let user = await User.findOne({ email });
	if (user) {
		return next(new ErrorHandler("User Already  Registered!", 400));
	}

	user = await User.create({ firstName, lastName, email, phone, dob, nic, gender, role, password });

	// res.status(200).json({
	// 	success: true,
	// 	message: "User Registered Successfullly!",
	// });
	generateToken(user, "User Registered Successfullly!", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
	const { email, password, confirmPassword, role } = req.body;

	if (!email || !password || !confirmPassword || !role) {
		return next(new ErrorHandler("Please Provide All Details", 400));
	}
	if (password !== confirmPassword) {
		return next(new ErrorHandler("Password and confirmPassword does not match", 400));
	}

	const user = await User.findOne({ email }).select("+password");
	if (!user) {
		return next(new ErrorHandler("Invlaid Password or Email 1", 400));
	}

	const isPasswordMatch = await user.comparePassword(password);
	if (!isPasswordMatch) {
		return next(new ErrorHandler("Invlaid Password or Email 2", 400));
	}
	if (role !== user.role) {
		return next(new ErrorHandler("User with this role not found", 400));
	}
	//# after passing all the above constraints user will be logged in
	// res.status(200).json({
	// 	success: true,
	// 	message: "User Logged In Successfullly!",
	// });
	generateToken(user, "User Logged In Successfullly!!", 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
	const { firstName, lastName, email, phone, nic, dob, gender, password } = req.body;
	if (!firstName || !lastName || !email || !phone || !nic || !dob || !gender || !password) {
		return next(new ErrorHandler("Please Fill Full Form!", 400));
	}

	const isRegistered = await User.findOne({ email });
	if (isRegistered) {
		return next(new ErrorHandler("Admin With This Email Already Exists!", 400));
	}

	const admin = await User.create({
		firstName,
		lastName,
		email,
		phone,
		nic,
		dob,
		gender,
		password,
		role: "Admin",
	});
	res.status(200).json({
		success: true,
		message: "New Admin Registered",
		admin,
	});
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
	const doctors = await User.find({ role: "Doctor" });
	res.status(200).json({
		success: true,
		doctors,
	});
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
	const user = req.user;
	res.status(200).json({
		success: true,
		user,
	});
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
	res
		.status(200)
		.cookie("adminToken", "", {
			httpOnly: true,
			expires: new Date(Date.now()),
            secure:true,
            sameSite:"None",
            
		})
		.json({
			success: true,
			message: "Admin Logged Out Successfully",
		});
});

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
	res
		.status(200)
		.cookie("patientToken", "", {
			httpOnly: true,
			expires: new Date(Date.now()),
            secure:true,
            sameSite:"None",
		})
		.json({
			success: true,
			message: "User Logged Out Successfully",
		});
});


//#111111111111111111111111111111111111111111111111111
export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
	if (!req.files || Object.keys(req.files).length === 0) {
		return next(new ErrorHandler("Doctor Avatar Required!", 400));
	}
	const { docAvatar } = req.files;
	const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
	if (!allowedFormats.includes(docAvatar.mimetype)) {
		return next(new ErrorHandler("File Format Not Supported!", 400));
	}
	const { firstName, lastName, email, phone, nic, dob, gender, password, doctorDepartment } = req.body;
	if (!firstName || !lastName || !email || !phone || !nic || !dob || !gender || !password || !doctorDepartment || !docAvatar) {
		return next(new ErrorHandler("Please Fill Full Form!", 400));
	}
	const isRegistered = await User.findOne({ email });
	if (isRegistered) {
		return next(new ErrorHandler("Doctor With This Email Already Exists!", 400));
	}
	const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
	if (!cloudinaryResponse || cloudinaryResponse.error) {
		console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary error");
		return next(new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500));
	}
	const doctor = await User.create({
		firstName,
		lastName,
		email,
		phone,
		nic,
		dob,
		gender,
		password,
		role: "Doctor",
		doctorDepartment,
		docAvatar: {
			public_id: cloudinaryResponse.public_id,
			url: cloudinaryResponse.secure_url,
		},
	});
	res.status(200).json({
		success: true,
		message: "New Doctor Registered",
		doctor,
	});
});
