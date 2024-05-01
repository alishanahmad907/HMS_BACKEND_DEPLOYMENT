import mongoose from "mongoose";


export const dbConnection = () => {
	mongoose
		.connect(process.env.MONGO_URL, {
			dbName: "HOSPITAL_MANAGEMENT_SYSTEM",
		})
		.then(() => {
			console.log("Connected to database successfully!");
		})
        .catch((err) => { 
            console.log(`Some Error occured while connecting to database : ${err}`);
         })
};
 