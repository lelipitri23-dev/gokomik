import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

const USER_ESSENTIAL_FIELDS = 'googleId email displayName photoURL isAdmin isPremium premiumUntil bio dailyDownloads';

export async function POST(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { googleId, email, displayName, photoURL } = body;

        if (!googleId) {
            return NextResponse.json({ success: false, message: 'googleId is required' }, { status: 400 });
        }

        const ADMIN_UIDS = ['BUkIZguy10hnIG8jAooZoycG7ak1'];
        const isUserAdmin = ADMIN_UIDS.includes(googleId);
        const today = new Date().toISOString().split('T')[0];

        const user = await User.findOneAndUpdate(
            { googleId },
            {
                $set: {
                    isAdmin: isUserAdmin,
                    ...(isUserAdmin  && { isPremium: true }),
                    ...(displayName  && { displayName }),
                    ...(photoURL     && { photoURL }),
                    ...(email        && { email }),
                },
                $setOnInsert: {
                    googleId,
                    isPremium:      isUserAdmin,
                    dailyDownloads: { date: today, count: 0 },
                },
            },
            { new: true, upsert: true, runValidators: false }
        ).lean();

        if (!isUserAdmin && user.isPremium && user.premiumUntil && new Date() > user.premiumUntil) {
            await User.updateOne({ googleId }, { $set: { isPremium: false, premiumUntil: null } });
            user.isPremium    = false;
            user.premiumUntil = null;
        }

        if (user.dailyDownloads?.date && user.dailyDownloads.date !== today) {
            await User.updateOne({ googleId }, { $set: { 'dailyDownloads.date': today, 'dailyDownloads.count': 0 } });
            user.dailyDownloads = { date: today, count: 0 };
        }

        return NextResponse.json({
            success: true,
            data: {
                googleId:       user.googleId,
                email:          user.email,
                displayName:    user.displayName,
                photoURL:       user.photoURL,
                isAdmin:        user.isAdmin,
                isPremium:      user.isPremium,
                premiumUntil:   user.premiumUntil,
                bio:            user.bio,
                dailyDownloads: user.dailyDownloads,
                downloadCount:  user.downloadCount,
            }
        });
    } catch (err) {
        console.error('User Sync Error:', err);
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}
