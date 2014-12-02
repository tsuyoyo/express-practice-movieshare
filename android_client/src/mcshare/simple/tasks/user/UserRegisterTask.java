/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.user;

import java.net.URI;
import java.net.URISyntaxException;

import mcshare.simple.tasks.TaskBase;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.util.Log;

public class UserRegisterTask extends TaskBase<String, Void, User> {

	private static String TAG = "UserRegisterTask";

	public interface IUserRegisterListener extends TaskBase.Listener<User> {
	}

	public UserRegisterTask(IUserRegisterListener listener, Context context) {
		super(listener, context);
	}

	@Override
	protected HttpRequestBase makeRequest(String... params) {

		String name = params[0];
		String mail = params[1];
		String team = params[2];
		String type = params[3];
		String adminRegisterKey = params[4];
		String registerKey = params[5];

		MultipartEntityBuilder builder = MultipartEntityBuilder.create();

		addTextBodyWithCharset(builder, "name", name);
		addTextBodyWithCharset(builder, "team", team);
		
		builder.addTextBody("mail", mail, ContentType.TEXT_PLAIN);
		builder.addTextBody("type", type, ContentType.TEXT_PLAIN);
		
		if (null != adminRegisterKey) {
			builder.addTextBody("adminregisterkey", adminRegisterKey, ContentType.TEXT_PLAIN);			
		}
		builder.addTextBody("registerkey", registerKey, ContentType.TEXT_PLAIN);

		String api = "http://" + getHost() + "/user/register/";

		try {
			HttpPost request = new HttpPost(new URI(api));
			request.setEntity(builder.build());
			return request;
		} catch (URISyntaxException e) {
			Log.e(TAG, "Failed to create http post in UserRegisterTask");
		}

		return null;
	}

	@Override
	protected User parseResponse(HttpResponse response) {
		return parseJSON(getJSON(response.getEntity()));
	}

	private User parseJSON(String data) {
		try {
			JSONObject root = new JSONObject(data);

			JSONObject user = root.getJSONObject("user");

			return User.parseUser(user);

		} catch (JSONException e) {
			Log.w(TAG, "Error happens during parsing JSON : " + e.getMessage());
		}
		return null;
	}

}
