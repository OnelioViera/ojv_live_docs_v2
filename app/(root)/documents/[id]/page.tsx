import CollaborativeRoom from "@/components/CollaborativeRoom"; // Fix import path
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/users.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Document = async ({ params: { id } }: SearchParamProps) => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const emailAddress = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!emailAddress) redirect('/');

  let room;
  try {
    room = await getDocument({
      roomId: id,
      userId: emailAddress,
    });
  } catch (error) {
    console.error("Failed to fetch document:", error);
    redirect('/');
  }

  if (!room) redirect('/');

  const userIds = Object.keys(room.usersAccesses);
  let users;
  try {
    users = await getClerkUsers({ userIds });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    users = [];
  }

  const usersData = users
    .filter((user: User) => user && user.email)
    .map((user: User) => ({
      ...user,
      userType: room.usersAccesses[user.email]?.includes('room:write')
        ? 'editor'
        : 'viewer',
    }));

  const currentUserType = room.usersAccesses[emailAddress]?.includes('room:write') ? 'editor' : 'viewer';

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  );
};

export default Document;


