/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
package mcshare.simple.host;

import mcshare.simple.common.CommonConsts;
import mcshare.test.R;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.view.View;
import android.widget.EditText;

public class HostChangeDialog extends AlertDialog {
	
	public static HostChangeDialog getInstance(Context context) {
		return new HostChangeDialog(context);
	}
	
	protected HostChangeDialog(Context context) {
		super(context);
		createView();
		
		setTitle("Host settings");
		setView(mRootView);
		setOnClickListener();
	}
	
	private View mRootView;
	
    private void createView() {
        mRootView = getLayoutInflater().inflate(R.layout.host_settings_fragment, null, false);
                
        EditText hostEdit = (EditText) mRootView.findViewById(R.id.host_address_edittext);
        hostEdit.setText(HostGetter.get(getContext()));
    }
    
    private void setOnClickListener() {
    	setButton(AlertDialog.BUTTON_POSITIVE, "Update", new OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {
                EditText hostEdit = (EditText) mRootView.findViewById(R.id.host_address_edittext);
                updateSharedPreference(hostEdit.getText().toString());
			}
		});
    }
    
    private void updateSharedPreference(String host) {
        SharedPreferences pref = PreferenceManager.getDefaultSharedPreferences(getContext());
        pref.edit().putString(CommonConsts.PREF_KEY_HOST_ADDRESS, host).apply();
    }

}
