import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
  mangaSlug: { type: String, required: true },
  chapterSlug: { type: String, required: true },
  title: String,
  chapterIndex: Number,
  images: [String],
  prevSlug: String,
  nextSlug: String,
  createdAt: { type: Date, default: Date.now }
});

chapterSchema.index({ mangaSlug: 1, chapterSlug: 1 }, { unique: true });
chapterSchema.index({ mangaSlug: 1, chapterIndex: 1 });
chapterSchema.index({ mangaSlug: 1, chapterIndex: -1 });

const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', chapterSchema);

export default Chapter;
