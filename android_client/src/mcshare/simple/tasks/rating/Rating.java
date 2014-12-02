/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.tasks.rating;

public class Rating {

	public final int index;

	public final RatingType type;

	public final String tag;

	public final String questionJp;

	public final String questionEn;

	public final String[] optionsJp;

	public final String[] optionsEn;
	
	public final String[] optionsTag;

	public Rating(int index, RatingType type, String tag, String questionJp,
			String questionEn, String[] optionsJp, String[] optionsEn, String[] optionsTag) {

		this.index = index;
		this.tag = tag;
		this.questionJp = questionJp;
		this.questionEn = questionEn;

		if (null != optionsJp && null != optionsEn && null != optionsTag) {
			this.optionsJp = optionsJp.clone();
			this.optionsEn = optionsEn.clone();			
			this.optionsTag = optionsTag.clone();
		} else {
			this.optionsJp = null;
			this.optionsEn = null;
			this.optionsTag = null;
		}

		this.type = type;

	}

}