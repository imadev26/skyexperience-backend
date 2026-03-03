import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    label: {
        en: { type: String, required: true, trim: true },
        fr: { type: String, required: true, trim: true }
    },
    value: {
        type: String,
        required: true,
        unique: true,
        trim: true
    }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
