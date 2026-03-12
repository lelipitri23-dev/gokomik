import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { successResponse, errorResponse } from '@/lib/api-helpers';

// DELETE: Remove specific manga from library
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { googleId, slug } = params;
    await User.updateOne({ googleId }, { $pull: { library: { slug } } });
    return successResponse({ message: 'Manga dihapus dari library' });
  } catch (err) {
    return errorResponse(err.message);
  }
}
