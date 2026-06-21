const API_KEY = "AIzaSyBQpJAVpfm7xRU3EFNvdelVQ5XVGzE97HQ";
const CHANNEL_ID = "UCtpFuaFnmiYvfwSnQyT4jjA";

async function loadVideos() {
    try {

        // Lấy 3 video mới nhất
        const searchUrl =
            `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}` +
            `&channelId=${CHANNEL_ID}` +
            `&part=snippet` +
            `&order=date` +
            `&maxResults=3` +
            `&type=video`;

        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        console.log(searchData);

        if (!searchData.items) {
            console.error(searchData);
            throw new Error("Không nhận được dữ liệu video");
        }

        const videos = searchData.items;
        // Lấy danh sách video ID
        const videoIds = videos
            .map(video => video.id.videoId)
            .join(",");

        // Lấy lượt xem
        const statsUrl =
            `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}` +
            `&part=statistics,contentDetails` +
            `&id=${videoIds}`;

        const statsResponse = await fetch(statsUrl);
        const statsData = await statsResponse.json();

        renderVideos(videos, statsData.items);

    } catch (error) {
        console.error("Lỗi YouTube API:", error);

        document.getElementById("youtube-videos").innerHTML = `
            <p>Không thể tải video.</p>
        `;
    }
}

function renderVideos(videos, stats) {

    const container = document.getElementById("youtube-videos");

    container.innerHTML = videos.map((video, index) => {

        const stat = stats[index];

        const views = Number(
            stat.statistics.viewCount
        ).toLocaleString("vi-VN");

        const published = formatTimeAgo(
            video.snippet.publishedAt
        );

        return `
            <a
                class="video-card"
                href="https://www.youtube.com/watch?v=${video.id.videoId}"
                target="_blank"
            >

                <div class="platform-tag">
                    YouTube
                </div>

                <img
                    src="${video.snippet.thumbnails.high.url}"
                    alt="${video.snippet.title}"
                    class="video-thumb"
                >

                <div class="video-info">

                    <h3>
                        ${video.snippet.title}
                    </h3>

                    <span>
                        ${views} lượt xem • ${published}
                    </span>

                </div>

            </a>
        `;
    }).join("");
}

function formatTimeAgo(dateString) {

    const now = new Date();
    const published = new Date(dateString);

    const diff =
        Math.floor((now - published) / 1000);

    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;

    if (diff < hour)
        return `${Math.floor(diff / minute)} phút trước`;

    if (diff < day)
        return `${Math.floor(diff / hour)} giờ trước`;

    if (diff < week)
        return `${Math.floor(diff / day)} ngày trước`;

    if (diff < month)
        return `${Math.floor(diff / week)} tuần trước`;

    if (diff < year)
        return `${Math.floor(diff / month)} tháng trước`;

    return `${Math.floor(diff / year)} năm trước`;
}

loadVideos();