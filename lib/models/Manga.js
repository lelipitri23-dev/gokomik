import mongoose from 'mongoose';

const mangaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  nativeTitle: String,
  slug: { type: String, unique: true },
  coverImage: String,
  type: { type: String, default: 'Manga' },
  rating: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  author: String,
  status: String,
  synopsis: String,
  genres: [String],
  chapters: [{
    title: String,
    slug: String,
    url: String,
    releaseDate: String
  }],
  sourceUrl: { type: String, unique: true },
  lastUpdated: { type: Date, default: Date.now }
});

const Manga = mongoose.models.Manga || mongoose.model('Manga', mangaSchema);

export default Manga;
