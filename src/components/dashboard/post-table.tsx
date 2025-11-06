"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";

export type DashboardPost = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  tone: string;
  audience: string;
};

type Props = {
  posts: DashboardPost[];
};

export function PostTable({ posts }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleDelete = async (postId: string) => {
    setBusyId(postId);
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setBusyId(null);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="card text-center text-sm text-zinc-400">
        <p>You haven&apos;t generated any posts yet. Start with the generator to create your first draft.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-800">
        <thead className="bg-zinc-900/60 text-left text-xs uppercase tracking-wide text-zinc-400">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Audience</th>
            <th className="px-4 py-3">Tone</th>
            <th className="px-4 py-3">Updated</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 bg-zinc-950/60">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-zinc-900/60">
              <td className="px-4 py-4">
                <div className="flex flex-col">
                  <Link href={`/post/${post.id}`} className="font-medium text-white hover:underline">
                    {post.title}
                  </Link>
                  <span className="text-xs text-zinc-500">
                    Created {format(new Date(post.createdAt), "MMM d, yyyy")} · Updated {" "}
                    {format(new Date(post.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-zinc-400">{post.audience}</td>
              <td className="px-4 py-4 text-sm text-zinc-400">{post.tone}</td>
              <td className="px-4 py-4 text-sm text-zinc-400">{format(new Date(post.updatedAt), "MMM d, yyyy HH:mm")}</td>
              <td className="px-4 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/post/${post.id}`}
                    className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                  >
                    {busyId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
