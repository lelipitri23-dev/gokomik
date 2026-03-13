import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Manga from '@/lib/models/Manga';
import Chapter from '@/lib/models/Chapter';

export const revalidate = 300;

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { slug, chapterSlug } = params;

        const [manga, chapter] = await Promise.all([
            Manga.findOne({ slug })
                .select('title slug coverImage')
                .lean(),
            Chapter.findOne({ mangaSlug: slug, chapterSlug })
                .select('title images prevSlug nextSlug createdAt')
                .lean()
        ]);

        if (!manga) return NextResponse.json({ success: false, message: 'Manga not found' }, { status: 404 });
        if (!chapter) return NextResponse.json({ success: false, message: 'Chapter not found' }, { status: 404 });

        return NextResponse.json({
            success: true,
            data: {
                chapter: {
                    title: chapter.title,
                    images: chapter.images,
                    createdAt: chapter.createdAt
                },
                manga,
                navigation: {
                    prev: chapter.prevSlug || null,
                    next: chapter.nextSlug || null
                }
            }
        });
    } catch (err) {
        console.error('Chapter Read API Error:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
