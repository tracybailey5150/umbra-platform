import { NextRequest, NextResponse } from "next/server";
import { ok, err } from "@umbra/shared";

/**
 * GET /api/notifications
 * Returns in-app notifications for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit      = parseInt(searchParams.get("limit") ?? "20");

    // TODO: Auth — get user from session
    // const user = await requireAuth();

    // TODO: Real DB query
    // const db = getDb();
    // const notifications = await db.query.notifications.findMany({
    //   where: and(
    //     eq(schema.notifications.userId, user.id),
    //     unreadOnly ? eq(schema.notifications.isRead, false) : undefined,
    //   ),
    //   orderBy: [desc(schema.notifications.createdAt)],
    //   limit,
    // });

    // Stub response for scaffolding
    const mockNotifications = [
      {
        id: "n1",
        title: "New submission from Marcus T.",
        body: "Roofing replacement request — score 87/100",
        actionUrl: "/leads/l1",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        id: "n2",
        title: "Follow-up due for Elena V.",
        body: "3 days since submission — follow-up ready to send",
        actionUrl: "/follow-ups",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        id: "n3",
        title: "Lead accepted — Nancy P.",
        body: "Kitchen remodel — $42k estimated value",
        actionUrl: "/leads/l8",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      },
    ].filter((n) => (unreadOnly ? !n.isRead : true)).slice(0, limit);

    return NextResponse.json(ok({
      items: mockNotifications,
      unreadCount: mockNotifications.filter((n) => !n.isRead).length,
    }));
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}

/**
 * PATCH /api/notifications
 * Mark notifications as read (single or bulk)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, markAllRead } = body;

    // TODO: Auth check
    // const user = await requireAuth();

    if (markAllRead) {
      // TODO: db.update — mark all user notifications as read
      // await db.update(schema.notifications)
      //   .set({ isRead: true, readAt: new Date() })
      //   .where(eq(schema.notifications.userId, user.id));
      return NextResponse.json(ok({ markedRead: "all" }));
    }

    if (!ids?.length) {
      return NextResponse.json(err("ids or markAllRead required"), { status: 400 });
    }

    // TODO: db.update — mark specific notifications as read
    // await db.update(schema.notifications)
    //   .set({ isRead: true, readAt: new Date() })
    //   .where(and(
    //     eq(schema.notifications.userId, user.id),
    //     inArray(schema.notifications.id, ids),
    //   ));

    return NextResponse.json(ok({ markedRead: ids.length }));
  } catch (error) {
    console.error("[PATCH /api/notifications]", error);
    return NextResponse.json(err("Internal server error"), { status: 500 });
  }
}
