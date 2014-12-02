/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.tag;

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

public class VideoTagsGetTask extends TaskBase<Void, Void, List<VideoTag>> {

	private static String TAG = "VideoTagsGetTask";

	public interface IVideoTagsGetterListener extends
			TaskBase.Listener<List<VideoTag>> {
	}

	public VideoTagsGetTask(IVideoTagsGetterListener listener, Context context) {
		super(listener, context);
	}

	private void parseJSON(String data, List<VideoTag> dist) {
		try {
			JSONObject root = new JSONObject(data);

			JSONArray categoryArray = root.getJSONArray("tags");
			for (int i = 0; i < categoryArray.length(); i++) {
				JSONObject category = categoryArray.getJSONObject(i);

				String id = (String) category.get("_id");
				String name = (String) category.get("name");
				dist.add(new VideoTag(id, name));
			}
		} catch (JSONException e) {
			Log.w(TAG, "Error happens during parsing JSON : " + e.getMessage());
		}
	}

	@Override
	protected HttpRequestBase makeRequest(Void... params) {
		return new HttpGet("http://" + getHost() + "/videotag/getall");
	}

	@Override
	protected List<VideoTag> parseResponse(HttpResponse response) {
		List<VideoTag> tags = new ArrayList<VideoTag>();

		HttpEntity entity = response.getEntity();

		// Parse result formatted by JSON.
		String json = getJSON(entity);
		if (null != json) {
			parseJSON(json, tags);
		}

		return tags;
	}

}
