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

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const { page, limit, skip } = getPaginationParams(searchParams);

        const [totalManga, recentsRaw, trendingRaw, manhwasRaw, mangasRaw, doujinshisRaw] = await Promise.all([
            Manga.countDocuments(),
            findMangaList({}, { lastUpdated: -1 }, skip, limit),
            findMangaList({}, { views: -1 }, 0, 10),
            findMangaList({ type: { $regex: 'manhwa', $options: 'i' } }, { lastUpdated: -1 }, 0, 10),
            findMangaList({ type: { $regex: 'manga', $options: 'i' } }, { lastUpdated: -1 }, 0, 10),
            findMangaList({ type: { $regex: 'doujinshi', $options: 'i' } }, { lastUpdated: -1 }, 0, 10),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                recents: formatMangaList(recentsRaw),
                trending: formatMangaList(trendingRaw),
                manhwas: formatMangaList(manhwasRaw),
                mangas: formatMangaList(mangasRaw),
                doujinshis: formatMangaList(doujinshisRaw),
            },
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalManga / limit),
                totalItems: totalManga,
                perPage: limit
            }
        });
    } catch (err) {
        console.error('Home API Error:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
