import numpy as np
from sklearn.ensemble import RandomForestRegressor

def func(x_js, y_js):
    x = np.asarray(x_js.to_py()).reshape(-1, 1)
    y = np.asarray(y_js.to_py()).reshape(-1, 1)

    regr = RandomForestRegressor(max_depth=2, random_state=0)
    regr = regr.fit(x, y)
    print(regr.feature_importances_)
    print(regr.score(x, y))
    return [regr.score(x, y), regr.feature_importances_]

func