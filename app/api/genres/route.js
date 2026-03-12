import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Manga from '@/lib/models/Manga';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        
        const genres = await Manga.aggregate([
            { $unwind: '$genres' },
            { $match: { genres: { $ne: '' } } },
            { $group: { _id: '$genres', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const formattedGenres = genres.map(g => ({ name: g._id, count: g.count }));
        
        return NextResponse.json({
            success: true,
            data: formattedGenres
        });
    } catch (err) {
        console.error('Genres API Error:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
