import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Manga from '@/lib/models/Manga';

const getPaginationParams = (searchParams, defaultLimit = 24) => {
    const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
    const limit = Math.max(1, parseInt(searchParams.get('limit')) || defaultLimit);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

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

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const { page, limit, skip } = getPaginationParams(searchParams);
        const q = searchParams.get('q');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const genre = searchParams.get('genre');
        const order = searchParams.get('order');

        let query = {};

        if (q) {
            query.title = { $regex: q, $options: 'i' };
        }
        if (status && status !== 'all') {
            query.status = { $regex: new RegExp(`^${status}$`, 'i') };
        }
        if (type && type !== 'all') {
            query.type = { $regex: new RegExp(`^${type}$`, 'i') };
        }
        if (genre && genre !== 'all') {
            const cleanGenre = genre.replace(/-/g, '[\\s\\-]');
            query.genres = { $regex: new RegExp(cleanGenre, 'i') };
        }

        let sortOption = { lastUpdated: -1 };
        switch (order) {
            case 'oldest': sortOption = { lastUpdated: 1 }; break;
            case 'popular': sortOption = { views: -1 }; break;
            case 'az': sortOption = { title: 1 }; break;
            case 'za': sortOption = { title: -1 }; break;
            default: sortOption = { lastUpdated: -1 };
        }

        const total = await Manga.countDocuments(query);

        const mangasRaw = await Manga.aggregate([
            { $match: query },
            { $sort: sortOption },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    title: 1,
                    slug: 1,
                    coverImage: 1,
                    type: 1,
                    status: 1,
                    rating: 1,
                    views: 1,
                    lastUpdated: 1,
                    chapter_count: { $size: { $ifNull: ['$chapters', []] } },
                    chapters: { $slice: ['$chapters', 1] }
                }
            }
        ]);

        const mangas = formatMangaList(mangasRaw);

        return NextResponse.json({
            success: true,
            data: mangas,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                perPage: limit,
            }
        });
    } catch (err) {
        console.error('Manga-list API Error:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
