/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.user;

import mcshare.simple.tasks.TaskBase;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpRequestBase;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.util.Log;

public class UserAuthenticateTask extends TaskBase<Void, Void, User> {

	private static String TAG = "UserAuthenticateTask";

	private final String mMail;

	private final String mAdminKey;

	public interface OnAuthenticateListener extends TaskBase.Listener<User> {
		// See base interface.
	}

	public UserAuthenticateTask(String mail, String adminkey,
			OnAuthenticateListener listener, Context context) {
		super(listener, context);
		mMail = mail;
		mAdminKey = adminkey;
	}

	@Override
	protected HttpRequestBase makeRequest(Void... params) {

		String signinPass = "mcshare";
		
		String api = "http://" + getHost() + "/user/authenticate/" + mMail + "/" + signinPass + "/";

		if (null != mAdminKey && 0 < mAdminKey.length()) {
			api += mAdminKey + "/";
		}

		return new HttpGet(api);
	}

	@Override
	protected User parseResponse(HttpResponse response) {
		User res = null;

		String json = getJSON(response.getEntity());
		if (null != json) {
			res = parseJSON(json);
		}

		return res;
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
