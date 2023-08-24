import { useContext } from "react";
import { dialogSettingsContext } from "../helpers/dialogContext";

import styles from "../../styles/dialog.module.css";

export function Dialog() {
    const { dialogSettings, closeDialog } = useContext(dialogSettingsContext);


    return (
        <div
            className="transition ease-in-out duration-200"
            style={{ opacity: dialogSettings.display ? 100 : 0 }}
        >
            {
                dialogSettings.display && (
                    <div className={styles.background} onClick={closeDialog}>
                        <div
                            className={styles.dialog}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.title}>{dialogSettings.title}</div>
                            <div className={styles.message}>
                                {
                                    dialogSettings?.message?.split("\n").map((segment, i) => <p key={i}>{segment}</p>)
                                }
                            </div>
                            <div className={styles.buttonGroup}>
                                {
                                    dialogSettings.buttons.map(({ callback, bg, text }, index) => (
                                        <button
                                            key={index}
                                            onClick={callback}
                                            className={`${bg} ${styles.button}`}
                                        >
                                            {text}
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}

