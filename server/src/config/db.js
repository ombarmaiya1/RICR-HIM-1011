import mongoose from 'mongoose';
import { MONGO_URI } from './config.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI)
        console.log(`MongoDB Connection Name: ${conn.connection.name}`)
        console.log(`MongoDB Connection Host: ${conn.connection.host}`)
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message)
        console.warn('Please ensure MONGO_URI environment variable is set correctly in your Render dashboard.')
    }
}

export default connectDB;