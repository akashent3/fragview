import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  action: string;
  createdAt: Date;
  user: {
    username: string;
    image: string | null;
  };
  details?: any;
}

interface Props {
  activities: Activity[];
}

const getActionIcon = (action: string) => {
  const icons: Record<string, string> = {
    APPROVE_SUBMISSION: '✅',
    REJECT_SUBMISSION: '❌',
    BAN_USER: '🚫',
    UNBAN_USER: '✓',
    PROMOTE_USER: '⭐',
    EDIT_PERFUME: '✏️',
    EDIT_BRAND: '🏢',
    DELETE_CONTENT: '🗑️',
    SET_FEATURED: '📌',
  };
  return icons[action] || '•';
};

const getActionText = (action: string, details?: any) => {
  const texts: Record<string, string> = {
    APPROVE_SUBMISSION: 'approved a community submission',
    REJECT_SUBMISSION: 'rejected a community submission',
    BAN_USER: 'banned a user',
    UNBAN_USER: 'unbanned a user',
    PROMOTE_USER: 'promoted a user to admin',
    EDIT_PERFUME: 'edited a perfume',
    EDIT_BRAND: 'edited a brand',
    DELETE_CONTENT: 'deleted content',
    SET_FEATURED: 'set featured content',
  };
  return texts[action] || action. toLowerCase(). replace(/_/g, ' ');
};

export default function ActivityFeed({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">No recent activity</p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {/* Icon */}
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg flex-shrink-0">
            {getActionIcon(activity.action)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">
              <span className="font-medium">{activity.user.username}</span>{' '}
              {getActionText(activity.action, activity. details)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}