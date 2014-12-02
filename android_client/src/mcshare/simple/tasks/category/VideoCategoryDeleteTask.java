/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.category;

import mcshare.simple.tasks.TaskBase;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpRequestBase;

import android.content.Context;
import android.util.Log;

public class VideoCategoryDeleteTask extends TaskBase<String, Void, Integer> {

	private static String TAG = "VideoCategoryDeleteTask";

	public interface ICategoryDeleteListener extends TaskBase.Listener<Integer> {
	}

	public VideoCategoryDeleteTask(ICategoryDeleteListener listener,
			Context context) {
		super(listener, context);
	}

	@Override
	protected HttpRequestBase makeRequest(String... params) {
		String id = params[0];
		String api = "http://" + getHost() + "/videocategory/delete/" + id;
		return new HttpGet(api);
	}

	@Override
	protected Integer parseResponse(HttpResponse response) {
		int statusCode = response.getStatusLine().getStatusCode();

		// 0 : OK, otherwise NG.
		if (HttpStatus.SC_OK == statusCode) {
			return 0;
		} else {
			Log.w(TAG, "Failed http request - " + statusCode);
			return -1;
		}
	}

}
