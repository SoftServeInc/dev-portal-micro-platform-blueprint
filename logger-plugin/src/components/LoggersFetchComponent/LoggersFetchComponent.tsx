import React, {useState, useEffect} from 'react';
import {
    TableContainer,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    Button,
    Snackbar,
    Grid, Box
} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import {Progress, ResponseErrorPanel} from '@backstage/core-components';

interface LoggersFetchComponentProps {
    url: string;
    authToken: string;
}

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    cell: {
        padding: '6px 12px',
        fontSize: '0.875rem',
    },
    refreshButton: {
        marginBottom: '16px',
    },
});

type LoggerData = {
    name: string;
    level: string;
};

const logLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];

type LoggerTableProps = {
    loggers: LoggerData[];
    onUpdateLoggerLevel: (name: string, newLevel: string) => void;
};

const LoggerTable: React.FC<LoggerTableProps> = ({loggers, onUpdateLoggerLevel}) => {
    const classes = useStyles();

    return (
        <TableContainer component={Paper}>
            <Table className={classes.table} size="small">
                <TableHead>
                    <TableRow>
                        <TableCell className={classes.cell}>Name</TableCell>
                        <TableCell className={classes.cell}>Level</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loggers.map(logger => (
                        <TableRow key={logger.name}>
                            <TableCell className={classes.cell}>{logger.name}</TableCell>
                            <TableCell className={classes.cell}>
                                <Select
                                    value={logger.level}
                                    onChange={event => onUpdateLoggerLevel(logger.name, event.target.value as string)}
                                    style={{fontSize: '0.875rem'}}
                                >
                                    {logLevels.map(level => (
                                        <MenuItem key={level} value={level}>
                                            {level}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export const LoggersFetchComponent: React.FC<LoggersFetchComponentProps> = ({url, authToken}) => {
    const classes = useStyles();

    const [loggers, setLoggers] = useState<LoggerData[] | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

    const fetchLoggers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${url}/actuator/loggers`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            if (!response.ok) throw new Error(`Failed to fetch loggers: HTTP ${response.status}`);

            const data = await response.json();

            const parsed: LoggerData[] = Object.entries(data.loggers)
                .map(([name, details]: any) => ({
                    name,
                    level: details.effectiveLevel,
                }))
                .sort((a, b) => a.name.localeCompare(b.name));

            setLoggers(parsed);
        } catch (e: any) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };

    const updateLoggerLevelOnServer = async (name: string, newLevel: string) => {
        try {
            const response = await fetch(`${url}/actuator/loggers/${name}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({configuredLevel: newLevel}),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Optimistic update
            setLoggers(prev =>
                prev?.map(logger =>
                    logger.name === name ? {...logger, level: newLevel} : logger,
                ) || [],
            );
        } catch (e) {
            console.error('Error updating logger level:', e);
            setSnackbarMessage(`Failed to update logger level for ${name}.`);
        }
    };

    const handleUpdateLoggerLevel = (name: string, level: string) => {
        updateLoggerLevelOnServer(name, level);
    };

    const handleRefresh = () => {
        fetchLoggers();
    };

    const handleCloseSnackbar = () => {
        setSnackbarMessage(null);
    };

    useEffect(() => {
        fetchLoggers();
    }, [url, authToken]);

    if (loading) return <Progress/>;
    if (error) return <ResponseErrorPanel error={error}/>;

    return (
        <Grid container direction="column" spacing={2}>
            <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRefresh}
                    startIcon={<RefreshIcon/>}
                    className={classes.refreshButton}
                >
                    Refresh
                </Button>
            </Box>

            <Grid item>
                <LoggerTable loggers={loggers || []} onUpdateLoggerLevel={handleUpdateLoggerLevel}/>
            </Grid>

            <Snackbar
                open={!!snackbarMessage}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
            />
        </Grid>
    );
};
