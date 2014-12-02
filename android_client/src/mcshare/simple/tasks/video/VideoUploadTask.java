/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.video;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.Charset;

import mcshare.simple.tasks.TaskBase;
import mcshare.simple.tasks.video.VideoUploadTask.Params;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.media.MediaMetadataRetriever;
import android.provider.MediaStore;
import android.util.Log;

public class VideoUploadTask extends TaskBase<Params, Void, Integer> {

	static private String TAG = "MC_VideoUploadTask";

	static private final String MIME_VIDEO_MP4 = "video/mp4";

	static private final String MIME_IMAGE_JPEG = "image/jpeg";

	static public class Error {
		public static final int BAD_URL = -1;

		public static final int FAILED_TO_UPLOAD = -2;

		public static final int UNSUPPORTED_VIDEO = -3;
	};

	static public class Params {
		final String contentId;
		final String title;
		final String userId;
		final String tagId;
		final String categoryId;
		final JSONObject rating;

		public Params(String contentId, String title, String userId,
				String tagId, String categoryId, JSONObject rating) {
			this.contentId = contentId;
			this.title = title;
			this.userId = userId;
			this.tagId = tagId;
			this.categoryId = categoryId;
			this.rating = rating;
		}
	}

	public interface IVideoUploadTaskListener extends
			TaskBase.Listener<Integer> {
	}

	/**
	 * Constructor.
	 * 
	 * @param context
	 */
	public VideoUploadTask(Context context, IVideoUploadTaskListener listener) {
		super(listener, context);
	}

	@Override
	protected HttpRequestBase makeRequest(Params... params) {

		Params p = params[0];

		Cursor c = mContext.getContentResolver().query(
				MediaStore.Video.Media.EXTERNAL_CONTENT_URI, null,
				MediaStore.Video.Media._ID + "=?",
				new String[] { p.contentId }, null);

		if (!c.moveToNext()) {
			return null;
		}

		// MimeType
		int mimeIndex = c.getColumnIndex(MediaStore.Video.Media.MIME_TYPE);
		String mimeType = c.getString(mimeIndex);
		if (!mimeType.equals(MIME_VIDEO_MP4)) {
			Log.e(TAG, "Unsupported type video : " + mimeType);
			return null;
		}

		// Video file
		int idIndex = c.getColumnIndex(MediaStore.Video.Media.DATA);
		String path = c.getString(idIndex);
		File videoFile = new File(path);

		// Thumbnail
		MediaMetadataRetriever retriever = new MediaMetadataRetriever();
		retriever.setDataSource(path);
		Bitmap thumbnail = retriever.getFrameAtTime(1000);
		String tmpThumbPath = mContext.getFilesDir().getPath();
		File tmpThumbnail = new File(tmpThumbPath + "/tmp.jpg");
		try {
			FileOutputStream out = new FileOutputStream(tmpThumbnail);
			thumbnail.compress(CompressFormat.JPEG, 100, out);
			out.flush();
			out.close();
		} catch (IOException e) {
			Log.e(TAG, "IOException " + e.getMessage());
			return null;
		}

		// VideoData =
		// { video : <filePath>,
		// thumbnail : <filePath>,
		// title : title,
		// userid : userObjectId,
		// tagid : tagObjectId,
		// categoryid : categoryObjectId,
		// rating : rating(Json) }

		// Make parameters.
		MultipartEntityBuilder builder = MultipartEntityBuilder.create();

		String[] splitVideoPath = path.split("/");
		String videoFileName = splitVideoPath[splitVideoPath.length - 1];

		builder.addBinaryBody("video", videoFile,
				ContentType.create(MIME_VIDEO_MP4), videoFileName);
		builder.addBinaryBody("thumbnail", tmpThumbnail,
				ContentType.create(MIME_IMAGE_JPEG), "tmp.jpg");

		addTextBodyWithCharset(builder, "title", p.title);

		String ratingsArray = "";
		try {
			ratingsArray = p.rating.getJSONArray("ratings").toString();
		} catch (JSONException e) {
			Log.e("VideoUploadTask", "failed to get ratings field");
		}
		builder.addTextBody("rating", ratingsArray,
				ContentType.APPLICATION_JSON.withCharset(Charset
						.forName("UTF-8")));

		builder.addTextBody("userid", p.userId);
		builder.addTextBody("categoryid", p.categoryId);
		if (null != p.tagId) {
			builder.addTextBody("tagid", p.tagId);
		}

		try {
			String api = "http://" + getHost() + "/video/upload";

			URI uploadUri = new URI(api);
			HttpPost request = new HttpPost(uploadUri);
			request.setEntity(builder.build());
			return request;

		} catch (URISyntaxException e) {

			return null;
		}

	}

	@Override
	protected Integer parseResponse(HttpResponse response) {
		return 0; // OK
	}

}
