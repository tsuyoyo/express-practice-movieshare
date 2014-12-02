/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.user;

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

public class UserGetAllTask extends TaskBase<Void, Void, List<User>> {

    private static String TAG = "UserGetAllTask";

    public interface IUserAllGetterListener extends TaskBase.Listener<List<User>> {
    }

    public UserGetAllTask(IUserAllGetterListener listener, Context context) {
    	super(listener, context);
    }
    
	@Override
	protected HttpRequestBase makeRequest(Void... params) {
        return new HttpGet("http://" + getHost() + "/user/getAllUsersInfo/");
	}

	@Override
	protected List<User> parseResponse(HttpResponse response) {

		HttpEntity entity = response.getEntity();

		List<User> users = new ArrayList<User>();

        String json = getJSON(entity);
        if (null != json) {
            parseJSON(json, users);
        }
        
		return users;
	}    

    private void parseJSON(String data, List<User> dist) {
        try {
            JSONObject root = new JSONObject(data);

            JSONArray categoryArray = root.getJSONArray("users");
            for (int i = 0; i < categoryArray.length(); i++) {
                JSONObject user = categoryArray.getJSONObject(i);

    			User userObj = User.parseUser(user);
    			if (null != userObj) {
    				dist.add(userObj);
    			}
    			
            }
        } catch (JSONException e) {
            Log.w(TAG, "Error happens during parsing JSON : " + e.getMessage());
        }
    }

}
