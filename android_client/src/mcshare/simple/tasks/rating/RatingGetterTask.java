/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.rating;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
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

public class RatingGetterTask extends TaskBase<Void, Void, List<Rating>> {

	private static String TAG = "VideoCategorySubmitTask";

	public interface IRatingGetterListener extends
			TaskBase.Listener<List<Rating>> {
	}

	public RatingGetterTask(IRatingGetterListener listener, Context context) {
		super(listener, context);
	}

	private void parseJSON(String data, List<Rating> dist) {
		try {
			JSONObject root = new JSONObject(data);

			JSONArray questions = root.getJSONArray("questions");

			for (int i = 0; i < questions.length(); i++) {

				JSONObject questionObj = questions.getJSONObject(i);

				int index = questionObj.getInt("index");
				String tag = questionObj.getString("tag");

				RatingType type = RatingType.get(questionObj.getString("type"));

				JSONObject question = questionObj.getJSONObject("question");
				String questionJp = question.getString("jp");
				String questionEn = question.getString("en");

				String[] optionsJp = null;
				String[] optionsEn = null;
				String[] optionsTag = null;

				if (!questionObj.isNull("options")) {
					JSONArray optionsObj = questionObj.getJSONArray("options");
					if (null != optionsObj) {
						optionsJp = new String[optionsObj.length()];
						optionsEn = new String[optionsObj.length()];
						optionsTag = new String[optionsObj.length()];

						for (int j = 0; j < optionsObj.length(); j++) {
							optionsJp[j] = optionsObj.getJSONObject(j)
									.getString("jp");
							optionsEn[j] = optionsObj.getJSONObject(j)
									.getString("en");
							optionsTag[j] = optionsObj.getJSONObject(j)
									.getString("tag");
						}
					}
				}

				dist.add(new Rating(index, type, tag, questionJp, questionEn,
						optionsJp, optionsEn, optionsTag));
			}
			
			// Sort rating items according to index
			Collections.sort(dist, new Comparator<Rating>() {

				@Override
				public int compare(Rating lhs, Rating rhs) {
					if (lhs.index > rhs.index) {
						return 1;
					}
					if (lhs.index < rhs.index) {
						return -1;
					}
					else {
						return 0;						
					}
				}				
			});
			
		} catch (JSONException e) {
			Log.w(TAG, "Error happens during parsing JSON : " + e.getMessage());
		}
	}

	@Override
	protected HttpRequestBase makeRequest(Void... params) {
		return new HttpGet("http://" + getHost() + "/question/getall/");
	}

	@Override
	protected List<Rating> parseResponse(HttpResponse response) {
		List<Rating> ratings = new ArrayList<Rating>();
		HttpEntity entity = response.getEntity();

		// Parse result formatted by JSON.
		String json = getJSON(entity);
		if (null != json) {
			parseJSON(json, ratings);
		}

		return ratings;
	}

}
