/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.video;

import java.util.ArrayList;
import java.util.List;

import mcshare.simple.tasks.TaskBase;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpRequestBase;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.util.Log;

public class VideoAllGetTask extends TaskBase<Void, Void, List<VideoData>> {

	private static String TAG = "VideoAllGetTask";

	public interface IVideoAllGetTaskListener extends
			TaskBase.Listener<List<VideoData>> {
	}

	public VideoAllGetTask(IVideoAllGetTaskListener listener, Context context) {
		super(listener, context);
	}

	private void parseJSON(String data, List<VideoData> dist) {
		try {
			JSONObject root = new JSONObject(data);

			JSONArray categoryArray = root.getJSONArray("videos");
			for (int i = 0; i < categoryArray.length(); i++) {
				JSONObject video = categoryArray.getJSONObject(i);

				String id = (String) video.get("_id");
				String title = (String) video.get("title");
				String videoPath = (String) video.get("video");
				String thumbnail = (String) video.get("thumbnailPath");
				long postedDate = (long) video.getLong("postedDate");
				String userId = (String) video.get("userid");
				String categoryId = (String) video.get("categoryid");
				String tagId = (String) video.get("tagid");

				dist.add(new VideoData(id, title, videoPath, userId, tagId,
						categoryId, thumbnail, postedDate));
			}
		} catch (JSONException e) {
			Log.w(TAG, "Error happens during parsing JSON : " + e.getMessage());
		}
	}

	@Override
	protected HttpRequestBase makeRequest(Void... params) {
		return new HttpGet("http://" + getHost() + "/video/getAll");
	}

	@Override
	protected List<VideoData> parseResponse(HttpResponse response) {

		List<VideoData> videos = new ArrayList<VideoData>();

		HttpEntity entity = response.getEntity();

		// Parse result formatted by JSON.
		String json = getJSON(entity);
		if (null != json) {
			parseJSON(json, videos);
		}

		return videos;
	}

}
