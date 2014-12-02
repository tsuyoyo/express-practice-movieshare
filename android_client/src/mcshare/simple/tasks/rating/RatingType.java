/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.rating;

public enum RatingType {

	FIVESTAR("fiveStar"),
	
	RADIO_BUTTON("radioBtn"),
	
	SELECTOR("select"),
	
	TEXT("text");
	
	public String nameOnServer;

	public static RatingType get(String nameOnServer) {
		for(RatingType type : values()) {
			if (nameOnServer.equals(type.nameOnServer)) {
				return type;
			}
		}
		return null;
	}
	
	private RatingType(String nameOnServer) {
		this.nameOnServer = nameOnServer;
	}
}
