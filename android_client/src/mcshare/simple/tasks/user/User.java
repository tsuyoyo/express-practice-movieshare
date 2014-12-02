/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.user;

import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

public class User {

	public final String id;

	public final String name;

	public final String mail;

	public final String type;

	public final String team;

	User(String id, String name, String mail, String type, String team) {
		this.id = id;
		this.name = name;
		this.mail = mail;
		this.type = type;
		this.team = team;
	}

	public static User parseUser(JSONObject json) {

		try {
			String id = (String) json.get("_id");
			String name = (String) json.get("name");
			String team = (String) json.get("team");
			String type = (String) json.get("type");
			String mail = (String) json.get("mail");

			return new User(id, name, mail, type, team);
			
		} catch (JSONException e) {
			Log.e("User", "Failed to parse json :" + e.getMessage());
			return null;
		}

	}

}
