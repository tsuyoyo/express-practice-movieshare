/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.category;

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

public class VideoCategoryGetterTask extends
		TaskBase<Void, Void, List<VideoCategory>> {

	private static String TAG = "VideoCategorySubmitTask";

	public interface ICategoryGetterListener extends
			TaskBase.Listener<List<VideoCategory>> {
	}
	
	public VideoCategoryGetterTask(ICategoryGetterListener listener, Context context) {
		super(listener, context);
	}

	private void parseJSON(String data, List<VideoCategory> dist) {
		try {
			JSONObject root = new JSONObject(data);

			JSONArray categoryArray = root.getJSONArray("categories");
			for (int i = 0; i < categoryArray.length(); i++) {
				JSONObject category = categoryArray.getJSONObject(i);

				String id = (String) category.get("_id");
				String name = (String) category.get("name");
				dist.add(new VideoCategory(id, name));
			}
		} catch (JSONException e) {
			Log.w(TAG, "Error happens during parsing JSON : " + e.getMessage());
		}
	}

	@Override
	protected HttpRequestBase makeRequest(Void... params) {
		return new HttpGet("http://" + getHost() + "/videocategory/getall/");
	}

	@Override
	protected List<VideoCategory> parseResponse(HttpResponse response) {
		List<VideoCategory> categories = new ArrayList<VideoCategory>();
		HttpEntity entity = response.getEntity();

		// Parse result formatted by JSON.
		String json = getJSON(entity);
		if (null != json) {
			parseJSON(json, categories);
		}
		return categories;
	}

}
