'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthModal } from '@/components/auth/AuthModal';
import { postArticleComment, deleteArticleComment } from '@/app/actions/drydown-comments';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Send, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    image: string | null;
    badges: string[];
  };
}

interface Props {
  articleId: string;
  initialComments: Comment[];
}

export default function ArticleComments({ articleId, initialComments }: Props) {
  const { data: session } = useSession();
  const { open } = useAuthModal();
  const router = useRouter();

  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e. preventDefault();

    if (!session) {
      open({ mode: 'signin', reason: 'Sign in to comment on articles' });
      return;
    }

    if (!content.trim()) return;

    setPosting(true);

    const result = await postArticleComment(articleId, content);

    if (result.success && result.comment) {
      setComments([...comments, result. comment]);
      setContent('');
      router.refresh();
    } else {
      alert('❌ ' + result.error);
    }

    setPosting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    setDeletingId(commentId);

    const result = await deleteArticleComment(commentId);

    if (result.success) {
      setComments(comments.filter((c) => c.id !== commentId));
      router.refresh();
    } else {
      alert('❌ ' + result.error);
    }

    setDeletingId(null);
  };

  return (
    <div className="mt-16 pt-12 border-t border-green-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Discussion ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      {session ?  (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white rounded-xl border border-green-100 p-4">
            <div className="flex items-start gap-3">
              {session.user.image ?  (
                <img
                  src={session.user.image}
                  alt={session.user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-orange-400 flex items-center justify-center text-white font-bold">
                  {session.user.username. charAt(0). toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts on this article..."
                  rows={3}
                  maxLength={1000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {content.length}/1000 characters
                  </span>
                  <button
                    type="submit"
                    disabled={posting || !content.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {posting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post Comment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-green-50 border border-green-100 rounded-xl text-center">
          <p className="text-gray-700 mb-3">Join the discussion!</p>
          <button
            onClick={() => open({ mode: 'signin', reason: 'Sign in to comment on articles' })}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Sign In to Comment
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No comments yet</p>
            <p className="text-sm mt-1">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                {comment.user.image ? (
                  <img
                    src={comment.user.image}
                    alt={comment.user. username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-orange-400 flex items-center justify-center text-white font-bold">
                    {comment.user. username.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">
                      {comment.user. username}
                    </span>
                    {comment.user.badges?. includes('Master') && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                        Master
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>

                {/* Delete Button */}
                {session &&
                  (session.user.id === comment.user.id || session.user.role === 'ADMIN') && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete comment"
                    >
                      {deletingId === comment.id ?  (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}