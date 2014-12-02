/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.tag;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import mcshare.simple.tasks.TaskBase;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.util.EntityUtils;

import android.content.Context;
import android.util.Log;

public class VideoTagSubmitTask extends TaskBase<Void, Void, Integer> {

	private static String TAG = "VideoTagSubmitTask";

	public static int RES_OK = 0;

	public static int RES_NG = -1;

	private final String mTagName;

	public interface ITagSubmitListener extends TaskBase.Listener<Integer> {
	}

	public VideoTagSubmitTask(String tagName, ITagSubmitListener listener,
			Context context) {
		super(listener, context);
		mTagName = tagName;
	}

	@Override
	protected HttpRequestBase makeRequest(Void... params) {

		MultipartEntityBuilder builder = MultipartEntityBuilder.create();

		addTextBodyWithCharset(builder, "name", mTagName);

		String api = "http://" + getHost() + "/videotag/add/";

		try {
			HttpPost request = new HttpPost(new URI(api));
			request.setEntity(builder.build());
			return request;
		} catch (URISyntaxException e) {
			Log.e(TAG, "URISyntaxException is thrown: " + e.getMessage());
		}
		return null;
	}

	@Override
	protected Integer parseResponse(HttpResponse response) {
		int statusCode = response.getStatusLine().getStatusCode();
		if (HttpStatus.SC_OK == statusCode) {
			return RES_OK;
		} else {
			Log.w(TAG, "Failed to submit tag : " + statusCode);
			try {
				Log.w(TAG, EntityUtils.toString(response.getEntity()));
			} catch (IOException e) {
			}
			return RES_NG;
		}
	}

}
