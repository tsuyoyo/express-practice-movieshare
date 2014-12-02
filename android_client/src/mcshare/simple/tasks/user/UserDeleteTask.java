/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.user;

import java.net.URI;
import java.net.URISyntaxException;

import mcshare.simple.tasks.TaskBase;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.mime.MultipartEntityBuilder;

import android.content.Context;
import android.util.Log;

public class UserDeleteTask extends TaskBase<Void, Void, Integer> {

	private static String TAG = "UserDeleteTask";

	public interface IUserDeleteListener extends TaskBase.Listener<Integer> {
	}

	private final String mUserId;

	public UserDeleteTask(String userId, IUserDeleteListener listener,
			Context context) {
		super(listener, context);
		mUserId = userId;
	}

	@Override
	protected HttpRequestBase makeRequest(Void... params) {

		MultipartEntityBuilder builder = MultipartEntityBuilder.create();
		builder.addTextBody("userid", mUserId);

		String api = "http://" + getHost() + "/user/unregister/";

		try {
			return new HttpPost(new URI(api));
		} catch (URISyntaxException e) {
			Log.e(TAG, "Failed to create HttpPost : " + e.getMessage());
			return null;
		}

	}

	@Override
	protected Integer parseResponse(HttpResponse response) {
		if (HttpStatus.SC_OK == response.getStatusLine().getStatusCode()) {
			return 0; // OK
		} else {
			return -1;
		}
	}
	
}
