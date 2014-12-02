/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.common;

public class CommonConsts {

	static public final String PREF_KEY_HOST_ADDRESS = "pref_key_host_address";

	// static public final String DEFAULT_HOST = "localhost:3000";
//	static public final String DEFAULT_HOST = "192.168.0.8:3000";
	static public final String DEFAULT_HOST = "54.64.16.36:3000";

	/**
	 * trueだと管理者用のメニューが出てくる
	 */
	static public final boolean IS_ADMIN_MODE = false;

	/**
	 * ユーザ名固定、カテゴリ固定などを行い、 特定用途向けのbuildならtrue
	 */
	static public final boolean IS_SPECIFIC_PURPOSE = true;

	/**
	 * 特定用途向けのbuildの場合の、固定カテゴリID
	 */
	static public final String SPECIFIC_CATEGORY = "53edb2ca7e77dd9422106655";

	/**
	 * 特定用途向けのbuildの場合のメールアドレス
	 */
	static public final String SPECIFIC_MAIL_ADDR = "mottopj01@mail.com";

	/**
	 * 特定用途向けのbuildの場合のパスワード
	 */
	static public final String SPECIFIC_PASSWORD = "mcshare";

	/**
	 * 特定用途向けのbuildの場合のタイトル
	 */
	static public final String SPECIFIC_PURPOSE_TITLE = "Movie uploader";
	
}
