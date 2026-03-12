import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Manga from '@/lib/models/Manga';

const formatMangaList = (mangas) => {
    return mangas.map(m => {
        const latestChap = m.chapters && m.chapters.length > 0 ? m.chapters[0] : null;
        return {
            _id: m._id,
            title: m.title,
            slug: m.slug,
            coverImage: m.coverImage,
            type: m.type,
            status: m.status,
            rating: m.rating,
            views: m.views || 0,
            lastUpdated: m.lastUpdated,
            chapter_count: m.chapter_count || 0,
            last_chapter: latestChap ? latestChap.title : '?',
            last_chapter_slug: latestChap ? latestChap.slug : ''
        };
    });
};

const findMangaList = async (matchQuery, sortOption, skip, limit) => {
    return Manga.aggregate([
        { $match: matchQuery },
        { $sort: sortOption },
        { $skip: skip },
        { $limit: limit },
        {
            $project: {
                title: 1, slug: 1, coverImage: 1, type: 1, status: 1,
                rating: 1, views: 1, lastUpdated: 1,
                chapter_count: { $size: { $ifNull: ['$chapters', []] } },
                chapters: { $slice: ['$chapters', 1] }
            }
        }
    ]);
};

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { slug } = params;

        const manga = await Manga.findOneAndUpdate(
            { slug },
            { $inc: { views: 1 } },
            {
                new: true,
                projection: {
                    title: 1, slug: 1, coverImage: 1, type: 1, status: 1,
                    rating: 1, views: 1, lastUpdated: 1, synopsis: 1,
                    genres: 1, author: 1, artist: 1,
                    'chapters.title': 1,
                    'chapters.slug': 1
                }
            }
        ).lean();

        if (!manga) {
            return NextResponse.json({ success: false, message: 'Manga not found' }, { status: 404 });
        }

        let recommendationsRaw = [];
        if (manga.genres && manga.genres.length > 0) {
            recommendationsRaw = await findMangaList(
                { genres: { $in: manga.genres }, _id: { $ne: manga._id } },
                { views: -1 },
                0,
                6
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                info: manga,
                recommendations: formatMangaList(recommendationsRaw)
            }
        });

    } catch (err) {
        console.error('Manga Detail API Error:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
