/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.host;

import mcshare.simple.common.CommonConsts;
import android.content.Context;
import android.preference.PreferenceManager;

public class HostGetter {

    static public String get(Context context) {
        return PreferenceManager.getDefaultSharedPreferences(context).getString(
                CommonConsts.PREF_KEY_HOST_ADDRESS, CommonConsts.DEFAULT_HOST);
    }

}
