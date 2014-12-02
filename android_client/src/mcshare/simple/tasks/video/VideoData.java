/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.video;

public class VideoData {

	public final String id;

	public final String title;

	public final String userId;

	public final String tagId;

	public final String categoryId;

	public final String uri;
	
	public final String thumbnail;
	
	public final long postedDate;

	VideoData(String id, String title, String uri, String userId, String tagId,
			String categoryId, String thumbnail, long postedDate) {
		this.id = id;
		this.title = title;
		this.uri = uri;
		this.userId = userId;
		this.tagId = tagId;
		this.categoryId = categoryId;
		this.thumbnail = thumbnail;
		this.postedDate = postedDate;
	}
}
