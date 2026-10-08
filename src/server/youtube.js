/**
 * YouTube Utility: Extracts video ID and retrieves official video metadata.
 * Uses official YouTube oEmbed API (no API key needed) and YouTube Data API v3 (if key provided).
 * Does NOT scrape or download audio - strictly metadata and official embed playback.
 */

// Common YouTube URL regex patterns
const YOUTUBE_REGEX = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;

export function extractYouTubeId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();

  // If already 11-char ID
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

/**
 * Fetch official metadata for a YouTube video.
 * Uses YouTube oEmbed first (fast, reliable, official, no quota).
 * If YOUTUBE_API_KEY is present in env, enriches with exact duration from Data API v3.
 */
export async function getYouTubeMetadata(videoId) {
  if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
    throw new Error('Invalid YouTube Video ID');
  }

  const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const apiKey = process.env.YOUTUBE_API_KEY;

  let title = 'YouTube Song';
  let channelName = 'YouTube Artist';
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  let duration = '3:45';

  // 1. Try YouTube Data API v3 if API key is configured
  if (apiKey && apiKey !== 'AIzaSyYourYouTubeDataApiKey') {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          title = item.snippet.title || title;
          channelName = item.snippet.channelTitle || channelName;
          
          const thumbs = item.snippet.thumbnails;
          if (thumbs?.maxres?.url) {
            thumbnail = thumbs.maxres.url;
          } else if (thumbs?.high?.url) {
            thumbnail = thumbs.high.url;
          } else if (thumbs?.medium?.url) {
            thumbnail = thumbs.medium.url;
          }

          if (item.contentDetails?.duration) {
            duration = parseIsoDuration(item.contentDetails.duration);
          }

          return {
            youtubeVideoId: videoId,
            youtubeUrl: standardUrl,
            title,
            channelName,
            thumbnail,
            duration,
          };
        }
      }
    } catch (err) {
      console.warn('YouTube Data API error, falling back to oEmbed:', err.message);
    }
  }

  // 2. Official YouTube oEmbed (Free, Official, No API key needed)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(standardUrl)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('YouTube video not found or is private/deleted.');
      }
      throw new Error(`Failed to retrieve video information (${res.status})`);
    }

    const data = await res.json();
    title = data.title || title;
    channelName = data.author_name || channelName;
    if (data.thumbnail_url) {
      // Use higher quality thumbnail if possible
      thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('private')) {
      throw err;
    }
    // Fallback gracefully with default values
    console.warn('oEmbed fetch error:', err.message);
  }

  return {
    youtubeVideoId: videoId,
    youtubeUrl: standardUrl,
    title,
    channelName,
    thumbnail,
    duration,
  };
}

// Convert ISO 8601 duration (PT3M45S) to "3:45"
function parseIsoDuration(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '3:30';

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  if (hours > 0) {
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }

  return `${minutes}:${formattedSeconds}`;
}
